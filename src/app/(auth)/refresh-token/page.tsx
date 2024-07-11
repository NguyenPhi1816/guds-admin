"use client";

import { doRefreshToken } from "@/actions";
import { DEFAULT_REDIRECT, ROOT } from "@/lib/routes";
import { useSession } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const RefreshToken = () => {
  const { data: session, update } = useSession();

  const searchParams = useSearchParams();
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetcher = async () => {
      if (session && !isFinished) {
        const refresh_token = session.user.refresh_token;
        const res = await doRefreshToken(refresh_token);

        if (res && res.access_token) {
          session.user.access_token = res.access_token;
          await update({ user: session.user });
          setIsSuccess(true);
        }

        setIsFinished(true);
      }
    };
    fetcher();
  }, [session, isFinished]);

  useEffect(() => {
    if (isFinished) {
      if (isSuccess) {
        const redirectTo = searchParams.get("redirect") || ROOT;
        redirect(redirectTo);
      } else {
        redirect(DEFAULT_REDIRECT);
      }
    }
  }, [isFinished]);

  return <></>;
};

export default RefreshToken;
