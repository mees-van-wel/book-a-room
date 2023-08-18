import axios, { AxiosError } from "axios";
import { NextApiResponse, NextApiRequest } from "next";

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  refresh_token: string;
  api_url: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TokenResponse | string>
) {
  if (req.method !== "POST")
    return res.status(405).send("Only POST requests allowed");

  const params = new URLSearchParams();

  if (req.body.code) {
    params.append("code", decodeURI(req.body.code));
    params.append("redirect_uri", "http://localhost:3000/settings");
    params.append("grant_type", "authorization_code");
  }

  if (req.body.refreshToken) {
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", decodeURI(req.body.refreshToken));
  }

  try {
    const { data } = await axios.post(
      "https://login.twinfield.com/auth/authentication/connect/token",
      params,
      {
        headers: {
          Cookie: "culture=nl-NL",
          Authorization:
            "Basic Ym9vay1hLXJvb206cVVpOGhKVCtTVWtuRVBaNXoxR0oza2pSeCtqeWR0RVM5UT09",
        },
      }
    );

    return res.status(200).json(data);
  } catch (error) {
    console.log(error);

    return res
      .status(401)
      .send(((error as AxiosError).response?.data as any).error.message?.value);
  }
}
