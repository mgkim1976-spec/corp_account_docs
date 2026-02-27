import { NextResponse } from "next/server";
import { documentTypes, caseTypes, rules } from "@/lib/engine/seedData";

export async function GET() {
    return NextResponse.json({ documentTypes, caseTypes, rules });
}
