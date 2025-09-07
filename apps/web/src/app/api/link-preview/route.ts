import { NextRequest, NextResponse } from "next/server";
import ogs from "open-graph-scraper";

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "Missing URL parameter" }, { status: 400 });
    }

    try {
        const { result } = await ogs({ url, timeout: 5000 });

        return NextResponse.json({
            title: result.ogTitle || null,
            description: result.ogDescription || null,
            image: result.ogImage?.[0]?.url || null,
            siteName: result.ogSiteName || null,
            url: result.requestUrl || url,
        });
        
    } catch (err) {
        console.warn("Link preview error:", err);
        return NextResponse.json({
            title: null,
            description: null,
            image: null,
            siteName: null,
            url,
        });
    }
}
