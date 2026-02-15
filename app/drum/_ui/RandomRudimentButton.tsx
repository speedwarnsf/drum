"use client";

import { useRouter } from "next/navigation";
import { ESSENTIAL_RUDIMENTS } from "../_lib/rudimentLibrary";
import { Icon } from "./Icon";

export default function RandomRudimentButton() {
  const router = useRouter();

  function handleClick() {
    const allIds = Object.keys(ESSENTIAL_RUDIMENTS);
    const randomId = allIds[Math.floor(Math.random() * allIds.length)];
    router.push(`/drum/rudiments/${randomId}`);
  }

  return (
    <button className="btn btn-ghost" onClick={handleClick} aria-label="Practice a random rudiment">
      <Icon name="shuffle" size={14} /> Random
    </button>
  );
}
