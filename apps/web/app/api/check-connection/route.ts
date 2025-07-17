import { connectToDB } from "@crewchat/db";
import { User } from "@crewchat/db";

export async function GET() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("MONGODB_URI is not defined in environment.");
    return new Response("Missing MONGODB_URI", { status: 500 });
  }

  try {
    await connectToDB(uri);

    const users = await User.find({});
    console.log(users)

    return new Response(JSON.stringify({
      connected: true,
      message: "Database connection successful.",
      users,
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("DB Connection Error:", error);
    return new Response(JSON.stringify({
      connected: false,
      message: "Failed to connect to database.",
      error: (error as Error).message,
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
