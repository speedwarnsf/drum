"use client";

import React, { useEffect, useState } from "react";

type VersionInfo = {
  commit: string;
  deployedAt: string;
};

export default function BuildTag() {
  const [info, setInfo] = useState<VersionInfo | null>(null);

  useEffect(() => {
    fetch("/api/version")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.commit) setInfo(data);
      })
      .catch(() => {});
  }, []);

  if (!info) return null;

  return <div className="build-tag">Build {info.commit}</div>;
}
