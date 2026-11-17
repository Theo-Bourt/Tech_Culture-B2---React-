import type { TechEvent } from "../types";

interface TimelineEventProps {
  event: TechEvent;
  isOpen: boolean;
  onToggle: () => void;
}

export function TimelineEvent({ event, isOpen, onToggle }: TimelineEventProps) {
  return (
    <li className="timeline-event">
      <button
        type="button"
        className="timeline-event__header"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="timeline-event__year">{event.annee}</span>
        <span className="timeline-event__title">{event.titre}</span>
        <span className="timeline-event__tag">{event.categorie}</span>
      </button>
      {isOpen && (
        <p className="timeline-event__description">{event.description}</p>
      )}
    </li>
  );
}
