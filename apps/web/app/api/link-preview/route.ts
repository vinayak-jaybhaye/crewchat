import { NextRequest, NextResponse } from "next/server";
import ogs from "open-graph-scraper";

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "Missing URL parameter" }, { status: 400 });
    }

    try {
        const { result } = await ogs({ url, timeout: 5000 });

        if (result.error) {
            return NextResponse.json({ error: "Failed to fetch OG data" }, { status: 500 });
        }

        return NextResponse.json({
            title: result.ogTitle,
            description: result.ogDescription,
            image: result.ogImage?.[0]?.url || null,
            siteName: result.ogSiteName,
            url: result.requestUrl,
        });
    } catch (err) {
        console.warn("Link preview error:", err);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
