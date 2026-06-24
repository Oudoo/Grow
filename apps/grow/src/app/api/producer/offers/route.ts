import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/offers — Create an offer for a passed candidate.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      candidateId,
      offeredSalary,
      firstWorkingDate,
      contractType,
      itEquipment,
    } = body;

    if (!candidateId || !offeredSalary || !firstWorkingDate || !contractType) {
      return NextResponse.json(
        { error: "candidateId, offeredSalary, firstWorkingDate, and contractType are required" },
        { status: 400 }
      );
    }

    // Verify candidate is in "passed" status
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    if (candidate.status !== "passed") {
      return NextResponse.json(
        { error: "Candidate must be in 'passed' status to receive an offer" },
        { status: 400 }
      );
    }

    // Create offer and update candidate status
    const [offer] = await prisma.$transaction([
      prisma.offer.create({
        data: {
          candidateId,
          offeredSalary: parseFloat(offeredSalary),
          firstWorkingDate,
          contractType,
          itEquipment: itEquipment || null,
        },
      }),
      prisma.candidate.update({
        where: { id: candidateId },
        data: { status: "offer_sent" },
      }),
    ]);

    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    console.error("Failed to create offer:", error);
    return NextResponse.json(
      { error: "Failed to create offer" },
      { status: 500 }
    );
  }
}
