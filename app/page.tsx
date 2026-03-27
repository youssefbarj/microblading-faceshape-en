"use client";

import React, { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookOpen, RotateCcw, GripVertical, Check, X } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

interface MatchData {
  faceId: string;
  faceLabel: string;
  faceColor: string;
  browId: string;
  browLabel: string;
  browColor: string;
  explanation: string;
}

const MATCHES: MatchData[] = [
  {
    faceId: "round",
    faceLabel: "Round face",
    faceColor: "bg-indigo-400/30 border-indigo-400/50",
    browId: "thick-angled",
    browLabel: "Thick angled brow",
    browColor: "bg-purple-500/40 border-purple-400/60",
    explanation:
      "Correct! Round face \u2192 thick angled brow because it slims the face.",
  },
  {
    faceId: "long",
    faceLabel: "Long face",
    faceColor: "bg-sky-400/30 border-sky-400/50",
    browId: "horizontal-long",
    browLabel: "Horizontal long brow",
    browColor: "bg-fuchsia-500/40 border-fuchsia-400/60",
    explanation:
      "Correct! Long face \u2192 horizontal long brow because it widens the face.",
  },
  {
    faceId: "small-eyes",
    faceLabel: "Small eyes",
    faceColor: "bg-teal-400/30 border-teal-400/50",
    browId: "thin-lifted",
    browLabel: "Thin lifted brow",
    browColor: "bg-rose-500/40 border-rose-400/60",
    explanation:
      "Correct! Small eyes \u2192 thin lifted brow because it opens the gaze.",
  },
  {
    faceId: "prominent-eyes",
    faceLabel: "Prominent eyes",
    faceColor: "bg-amber-400/30 border-amber-400/50",
    browId: "full-extended",
    browLabel: "Full extended brow",
    browColor: "bg-emerald-500/40 border-emerald-400/60",
    explanation:
      "Correct! Prominent eyes \u2192 full extended brow because it balances the features.",
  },
];

/* ------------------------------------------------------------------ */
/* Draggable brow card                                                 */
/* ------------------------------------------------------------------ */

function DraggableBrow({
  id,
  label,
  colorClass,
  disabled,
}: {
  id: string;
  label: string;
  colorClass: string;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        ${colorClass} border-2 rounded-xl px-4 py-5 text-center font-semibold
        select-none transition-all duration-200
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-grab active:cursor-grabbing hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"}
        ${isDragging ? "opacity-30" : ""}
      `}
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        {!disabled && <GripVertical className="w-4 h-4 text-white/50" />}
        <span className="text-sm font-bold tracking-wide text-white/90 uppercase">
          Brow
        </span>
      </div>
      <div className="h-10 rounded-lg bg-white/10 flex items-center justify-center mb-2">
        <span className="text-xs text-white/60">~ shape preview ~</span>
      </div>
      <p className="text-white text-sm">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Overlay card (follows pointer while dragging)                       */
/* ------------------------------------------------------------------ */

function BrowOverlay({
  label,
  colorClass,
}: {
  label: string;
  colorClass: string;
}) {
  return (
    <div
      className={`${colorClass} border-2 rounded-xl px-4 py-5 text-center font-semibold shadow-2xl shadow-purple-500/30 scale-105`}
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        <GripVertical className="w-4 h-4 text-white/50" />
        <span className="text-sm font-bold tracking-wide text-white/90 uppercase">
          Brow
        </span>
      </div>
      <div className="h-10 rounded-lg bg-white/10 flex items-center justify-center mb-2">
        <span className="text-xs text-white/60">~ shape preview ~</span>
      </div>
      <p className="text-white text-sm">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Droppable face zone                                                 */
/* ------------------------------------------------------------------ */

function DroppableFace({
  id,
  label,
  colorClass,
  matchedBrow,
  isCorrect,
  isWrong,
}: {
  id: string;
  label: string;
  colorClass: string;
  matchedBrow: string | null;
  isCorrect: boolean;
  isWrong: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`
        ${colorClass} border-2 rounded-xl p-4 text-center transition-all duration-300
        ${isOver ? "ring-2 ring-purple-400 scale-[1.03] shadow-lg shadow-purple-500/20" : ""}
        ${isCorrect ? "ring-2 ring-emerald-400 bg-emerald-500/20 border-emerald-400/60" : ""}
        ${isWrong ? "animate-pulse ring-2 ring-red-400" : ""}
      `}
    >
      <span className="text-xs font-bold tracking-wide text-white/70 uppercase">
        Face
      </span>
      <div className="h-20 rounded-lg bg-white/10 flex items-center justify-center my-2">
        <span className="text-xs text-white/50">~ face preview ~</span>
      </div>
      <p className="text-white font-semibold text-sm mb-3">{label}</p>

      {/* Drop zone indicator */}
      <div
        className={`
          min-h-[44px] rounded-lg border-2 border-dashed flex items-center justify-center text-xs transition-colors
          ${isCorrect ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-300" : "border-white/20 text-white/40"}
          ${isOver && !isCorrect ? "border-purple-400/60 bg-purple-500/10 text-purple-300" : ""}
        `}
      >
        {isCorrect ? (
          <span className="flex items-center gap-1">
            <Check className="w-4 h-4" /> {matchedBrow}
          </span>
        ) : (
          "Drop brow here"
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

export default function GamePage() {
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [wrongShake, setWrongShake] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const score = Object.keys(matched).length;

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 150, tolerance: 5 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  /* Which brow ids are already placed */
  const placedBrows = new Set(Object.values(matched));

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setFeedback(null);
    setWrongShake(null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) return;

      const browId = active.id as string;
      const faceId = over.id as string;

      /* Already matched? */
      if (matched[faceId]) return;

      const match = MATCHES.find(
        (m) => m.faceId === faceId && m.browId === browId
      );

      if (match) {
        setMatched((prev) => ({ ...prev, [faceId]: browId }));
        setFeedback(match.explanation);
      } else {
        setWrongShake(faceId);
        setFeedback("Incorrect match. Try again!");
        setTimeout(() => setWrongShake(null), 700);
      }
    },
    [matched]
  );

  const handleReset = () => {
    setMatched({});
    setFeedback(null);
    setWrongShake(null);
  };

  const activeMatch = MATCHES.find((m) => m.browId === activeId);

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* ---- Header ---- */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
            Morphological Analysis &mdash; Mini Game
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Drag and drop the eyebrow shapes onto the matching face types
          </p>
        </div>

        {/* ---- Toolbar ---- */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Badge
            variant="secondary"
            className="text-base px-4 py-1.5 bg-secondary/80"
          >
            Score: {score}/4
          </Badge>

          {/* Guide dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <BookOpen className="w-4 h-4" />
                GUIDE
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[hsl(232,30%,14%)] border-border">
              <DialogHeader>
                <DialogTitle className="text-purple-300">
                  Matching Guide
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Use these rules to match each face type with the correct
                  eyebrow shape.
                </DialogDescription>
              </DialogHeader>
              <ul className="space-y-3 mt-2 text-sm text-foreground/90">
                {MATCHES.map((m) => (
                  <li key={m.faceId} className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">&#8226;</span>
                    <span>
                      <strong className="text-white">{m.faceLabel}</strong>{" "}
                      &rarr;{" "}
                      <strong className="text-purple-300">{m.browLabel}</strong>{" "}
                      &mdash;{" "}
                      {m.explanation
                        .replace("Correct! ", "")
                        .replace(
                          /.*because /,
                          ""
                        )
                        .replace(/^\w/, (c) => c.toUpperCase())}
                      .
                    </span>
                  </li>
                ))}
              </ul>
            </DialogContent>
          </Dialog>

          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        {/* ---- Feedback banner ---- */}
        {feedback && (
          <Card
            className={`mx-auto max-w-xl border ${
              feedback.startsWith("Correct")
                ? "border-emerald-500/50 bg-emerald-500/10"
                : "border-red-500/50 bg-red-500/10"
            }`}
          >
            <CardContent className="py-3 px-4 text-center text-sm flex items-center justify-center gap-2">
              {feedback.startsWith("Correct") ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <X className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span
                className={
                  feedback.startsWith("Correct")
                    ? "text-emerald-300"
                    : "text-red-300"
                }
              >
                {feedback}
              </span>
            </CardContent>
          </Card>
        )}

        {/* ---- Game area ---- */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Face drop zones */}
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 text-center">
                Face Types
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {MATCHES.map((m) => (
                  <DroppableFace
                    key={m.faceId}
                    id={m.faceId}
                    label={m.faceLabel}
                    colorClass={m.faceColor}
                    matchedBrow={
                      matched[m.faceId]
                        ? MATCHES.find((x) => x.browId === matched[m.faceId])
                            ?.browLabel ?? null
                        : null
                    }
                    isCorrect={!!matched[m.faceId]}
                    isWrong={wrongShake === m.faceId}
                  />
                ))}
              </div>
            </section>

            {/* Brow draggables */}
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 text-center">
                Eyebrow Shapes
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {MATCHES.map((m) => (
                  <DraggableBrow
                    key={m.browId}
                    id={m.browId}
                    label={m.browLabel}
                    colorClass={m.browColor}
                    disabled={placedBrows.has(m.browId)}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* Drag overlay */}
          <DragOverlay dropAnimation={null}>
            {activeMatch ? (
              <BrowOverlay
                label={activeMatch.browLabel}
                colorClass={activeMatch.browColor}
              />
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* ---- Victory ---- */}
        {score === 4 && (
          <Card className="mx-auto max-w-md border-emerald-500/50 bg-emerald-500/10">
            <CardContent className="py-6 text-center space-y-3">
              <p className="text-2xl font-bold text-emerald-300">
                Congratulations!
              </p>
              <p className="text-muted-foreground text-sm">
                You matched all 4 face types correctly. Great morphological
                analysis skills!
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handleReset}
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
