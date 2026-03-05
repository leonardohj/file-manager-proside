import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { token } = await req.json();

    const publicKey = fs.readFileSync(
      path.join(process.cwd(), "app/keys/jwt/jwt-public.pem"),
      "utf8"
    );

    // verify token
    const decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"] });

    return new Response(JSON.stringify({ valid: true, decoded }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ valid: false, error: err.message }), { status: 401 });
  }
}