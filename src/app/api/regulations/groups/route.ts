import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch only top-level groups (no parent)
    const groups = await prisma.regulationGroup.findMany({
      where: {
        parentId: null,
      },
      include: {
        children: {
          include: {
            children: true, // This will go 2 levels deep
          },
        },
      },
    });

    return NextResponse.json(groups);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch regulation groups" },
      { status: 500 }
    );
  }
}
