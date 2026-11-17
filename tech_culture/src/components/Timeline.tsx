import { useMemo, useState } from "react";
import type { TechEvent } from "../types";
import { TimelineEvent } from "./TimelineEvent";

interface TimelineProps {
  events: TechEvent[];
}

export function Timeline({ events }: TimelineProps) {
  const [recentFirst, setRecentFirst] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  // Tri natif (stable, renvoie une copie), recalculé seulement
  // quand la liste ou le sens du tri change.
  const sortedEvents = useMemo(
    () =>
      events.toSorted((a, b) =>
        recentFirst ? b.annee - a.annee : a.annee - b.annee,
      ),
    [events, recentFirst],
  );

  function handleToggle(id: string) {
    setOpenId((current) => (current === id ? null : id));
  }

  return (
    <section>
      <button
        type="button"
        className="timeline__sort"
        onClick={() => setRecentFirst((value) => !value)}
      >
        {recentFirst ? "Du plus récent au plus ancien" : "Du plus ancien au plus récent"}
      </button>

      {sortedEvents.length === 0 ? (
        <p>Aucun événement pour le moment.</p>
      ) : (
        <ul className="timeline">
          {sortedEvents.map((event) => (
            <TimelineEvent
              key={event.id}
              event={event}
              isOpen={openId === event.id}
              onToggle={() => handleToggle(event.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
