import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  retryPendingEmailDeliveries,
} from "@/lib/email/retry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  limit: z
    .number()
    .int()
    .positive()
    .max(100)
    .optional(),
});

function authorized(request: Request): boolean {
  const expected =
    process.env.EMAIL_RETRY_SECRET;

  if (!expected) {
    console.error(
      "EMAIL_RETRY_SECRET is not configured.",
    );

    return false;
  }

  const authorization =
    request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return false;
  }

  const supplied =
    authorization.slice(
      "Bearer ".length,
    );

  const expectedBuffer =
    Buffer.from(expected);

  const suppliedBuffer =
    Buffer.from(supplied);

  if (
    expectedBuffer.length !==
    suppliedBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    expectedBuffer,
    suppliedBuffer,
  );
}

export async function POST(
  request: Request,
) {
  if (!authorized(request)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  try {
    let body: unknown = {};

    const contentLength =
      request.headers.get(
        "content-length",
      );

    if (
      contentLength &&
      contentLength !== "0"
    ) {
      body = await request.json();
    }

    const parsed =
      requestSchema.parse(body);

    const results =
      await retryPendingEmailDeliveries(
        parsed.limit ?? 25,
      );

    const summary = {
      total: results.length,
      sent:
        results.filter(
          (item) =>
            item.status === "SENT",
        ).length,
      skipped:
        results.filter(
          (item) =>
            item.status === "SKIPPED",
        ).length,
      failed:
        results.filter(
          (item) =>
            item.status === "FAILED",
        ).length,
      notRetryable:
        results.filter(
          (item) =>
            item.status ===
            "NOT_RETRYABLE",
        ).length,
    };

    console.log(
      "EMAIL_RETRY_BATCH_PROCESSED",
      summary,
    );

    return NextResponse.json({
      ok: true,
      summary,
      results,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Invalid retry request.",
        },
        {
          status: 400,
        },
      );
    }

    console.error(
      "EMAIL_RETRY_BATCH_FAILED",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Email retry batch failed.",
      },
      {
        status: 500,
      },
    );
  }
}
