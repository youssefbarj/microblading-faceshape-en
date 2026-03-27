"use client"

import React, { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CircleHelp, RotateCcw, CheckCircle2 } from "lucide-react"

/* ------------------------------------------------------------------ */
/* Data — exact replica of French original, translated to English      */
/* ------------------------------------------------------------------ */

const FACES = [
  {
    id: "round",
    name: "Round face",
    image: "/images/round-face.webp",
    correctBrow: "thick-angled",
    explanation:
      "Correct! Round face → thick angled brow because it slims the face.",
  },
  {
    id: "long",
    name: "Long face",
    image: "/images/long-face.jpeg",
    correctBrow: "horizontal-long",
    explanation:
      "Correct! Long face → horizontal long brow because it widens the face.",
  },
  {
    id: "small-eyes",
    name: "Small eyes",
    image: "/images/small-eyes.jpeg",
    correctBrow: "thin-lifted",
    explanation:
      "Correct! Small eyes → thin lifted brow because it opens the gaze.",
  },
  {
    id: "protruding",
    name: "Prominent eyes",
    image: "/images/protruding-eyes.jpeg",
    correctBrow: "full-extended",
    explanation:
      "Correct! Prominent eyes → full extended brow because it balances the gaze.",
  },
]

const BROWS = [
  {
    id: "thick-angled",
    name: "Thick angled brow",
    image: "/images/thick-angled-brows.jpeg",
  },
  {
    id: "horizontal-long",
    name: "Horizontal long brow",
    image: "/images/horizontal-long-brows.jpeg",
  },
  {
    id: "thin-lifted",
    name: "Thin lifted brow",
    image: "/images/thin-lifted-brows.jpeg",
  },
  {
    id: "full-extended",
    name: "Full extended brow",
    image: "/images/full-extended-brows.jpeg",
  },
]

/* ------------------------------------------------------------------ */
/* Main component — mirrors French original layout & interactions      */
/* ------------------------------------------------------------------ */

export default function FaceShapeGame() {
  const [matches, setMatches] = useState<Record<string, string>>({})
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [dragItem, setDragItem] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [guideOpen, setGuideOpen] = useState(false)
  const [endOpen, setEndOpen] = useState(false)
  const dragCounters = useRef<Record<string, number>>({})

  const handleDragStart = (e: React.DragEvent, browId: string) => {
    setDragItem(browId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDragEnter = (e: React.DragEvent, faceId: string) => {
    e.preventDefault()
    dragCounters.current[faceId] = (dragCounters.current[faceId] || 0) + 1
  }

  const handleDragLeave = (_e: React.DragEvent, faceId: string) => {
    dragCounters.current[faceId] = (dragCounters.current[faceId] || 0) - 1
  }

  const handleDrop = (e: React.DragEvent, faceId: string) => {
    e.preventDefault()
    dragCounters.current[faceId] = 0
    if (!dragItem) return

    const face = FACES.find((f) => f.id === faceId)
    const isCorrect = face?.correctBrow === dragItem

    setMatches((prev) => ({ ...prev, [faceId]: dragItem }))

    if (isCorrect && face) {
      setFeedback((prev) => ({ ...prev, [faceId]: face.explanation }))
      setScore((prev) => prev + 1)
    } else {
      setFeedback((prev) => ({
        ...prev,
        [faceId]: "Try again! This combination is not optimal.",
      }))
    }

    setDragItem(null)
  }

  const handleReset = () => {
    setMatches({})
    setFeedback({})
    setScore(0)
    setEndOpen(false)
    dragCounters.current = {}
  }

  const allDone = Object.keys(matches).length === FACES.length
  const correctCount = Object.entries(matches).filter(([faceId, browId]) => {
    const face = FACES.find((f) => f.id === faceId)
    return face?.correctBrow === browId
  }).length

  useEffect(() => {
    if (allDone) setEndOpen(true)
  }, [allDone])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-1 sm:p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-2 sm:mb-4">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-900 mb-1 px-2">
            Morphological Analysis - Mini Game
          </h1>
          <p className="text-xs sm:text-sm text-purple-700 mb-2 px-2">
            Drag and drop the eyebrow shapes onto the matching face types
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-2 px-2">
            <Badge
              variant="secondary"
              className="bg-purple-200 text-purple-800 text-xs sm:text-sm px-3 py-1"
            >
              Score: {correctCount}/{FACES.length}
            </Badge>

            <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold shadow-lg animate-pulse border-2 border-purple-300 px-3 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm min-h-[44px] touch-manipulation"
                >
                  <CircleHelp className="w-4 h-4 mr-1 sm:mr-2" />
                  GUIDE
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-2xl mx-2 sm:mx-4 max-h-[85vh] sm:max-h-[90vh] flex flex-col fixed top-64 left-1/2 transform -translate-x-1/2">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle className="text-purple-900 text-base sm:text-lg">
                    Eyebrow Shape Guide
                  </DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pr-1 sm:pr-2">
                  <p className="text-xs sm:text-sm text-gray-700">
                    Eyebrow design should be adapted to facial morphology to
                    balance features:
                  </p>
                  <div className="grid gap-2 sm:gap-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 bg-purple-50 rounded-lg gap-1 sm:gap-0">
                      <span className="font-medium text-purple-900 text-sm">
                        Round face
                      </span>
                      <span className="text-xs sm:text-sm text-purple-700">
                        → Thick angled brows
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 bg-purple-50 rounded-lg gap-1 sm:gap-0">
                      <span className="font-medium text-purple-900 text-sm">
                        Long face
                      </span>
                      <span className="text-xs sm:text-sm text-purple-700">
                        → Long, low-arched brows
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 bg-purple-50 rounded-lg gap-1 sm:gap-0">
                      <span className="font-medium text-purple-900 text-sm">
                        Prominent eyes
                      </span>
                      <span className="text-xs sm:text-sm text-purple-700">
                        → Full extended brows
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 bg-purple-50 rounded-lg gap-1 sm:gap-0">
                      <span className="font-medium text-purple-900 text-sm">
                        Small eyes
                      </span>
                      <span className="text-xs sm:text-sm text-purple-700">
                        → Thin lifted brows
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 bg-purple-50 rounded-lg gap-1 sm:gap-0">
                      <span className="font-medium text-purple-900 text-sm">
                        Wide-set eyes / short nose
                      </span>
                      <span className="text-xs sm:text-sm text-purple-700">
                        → Brow heads closer together
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 bg-purple-50 rounded-lg gap-1 sm:gap-0">
                      <span className="font-medium text-purple-900 text-sm">
                        Long nose
                      </span>
                      <span className="text-xs sm:text-sm text-purple-700">
                        → Brow heads further apart
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 italic">
                    Use this guide to make the right matches in the game!
                  </p>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent text-xs sm:text-sm min-h-[44px] touch-manipulation px-3 py-2"
            >
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Game grid — 3 columns on lg: faces (2 cols) + brows (1 col) */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-2 sm:gap-4">
          {/* Face cards */}
          <div className="lg:col-span-2 space-y-2">
            <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-purple-900 text-center px-2">
              Face Types
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 px-1 sm:px-0">
              {FACES.map((face) => {
                const isCorrect =
                  matches[face.id] &&
                  FACES.find((f) => f.id === face.id)?.correctBrow ===
                    matches[face.id]
                return (
                  <Card
                    key={face.id}
                    className={`transition-all duration-200 touch-manipulation ${
                      dragCounters.current[face.id] > 0
                        ? "border-purple-400 bg-purple-50 scale-105"
                        : "border-purple-200"
                    } ${
                      isCorrect ? "border-green-400 bg-green-50" : ""
                    }`}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, face.id)}
                    onDragLeave={(e) => handleDragLeave(e, face.id)}
                    onDrop={(e) => handleDrop(e, face.id)}
                  >
                    <CardHeader className="pb-1 sm:pb-2">
                      <CardTitle className="text-xs sm:text-sm text-purple-800 flex items-center gap-2">
                        {face.name}
                        {isCorrect && (
                          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 sm:p-3">
                      <div className="space-y-2">
                        <img
                          src={face.image}
                          alt={face.name}
                          className="w-28 h-28 sm:w-32 sm:h-32 lg:w-44 lg:h-44 object-contain rounded-lg bg-white p-2 border border-purple-100 mx-auto"
                        />
                        {matches[face.id] && (
                          <div className="text-center">
                            <img
                              src={
                                BROWS.find((b) => b.id === matches[face.id])
                                  ?.image
                              }
                              alt="Matched brow"
                              className="w-20 h-10 sm:w-24 sm:h-12 lg:w-36 lg:h-18 object-contain bg-white rounded p-1 border border-purple-100 mx-auto"
                            />
                          </div>
                        )}
                        {feedback[face.id] && (
                          <p
                            className={`text-xs ${
                              isCorrect
                                ? "text-green-700 bg-green-100"
                                : "text-orange-700 bg-orange-100"
                            } p-2 rounded leading-relaxed`}
                          >
                            {feedback[face.id]}
                          </p>
                        )}
                        {!matches[face.id] && (
                          <div className="border-2 border-dashed border-purple-300 rounded-lg p-3 sm:p-2 text-center text-purple-500 text-xs min-h-[44px] flex items-center justify-center">
                            Drop zone
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Brow cards */}
          <div className="space-y-2">
            <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-purple-900 text-center px-2">
              Eyebrow Shapes
            </h2>
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 px-1 sm:px-0">
              {BROWS.map((brow) => {
                const isUsed = Object.values(matches).includes(brow.id)
                return (
                  <Card
                    key={brow.id}
                    className={`cursor-move transition-all duration-200 flex-shrink-0 lg:flex-shrink min-w-[140px] sm:min-w-[120px] lg:min-w-0 touch-manipulation ${
                      isUsed
                        ? "opacity-50 bg-gray-100"
                        : "hover:shadow-lg hover:scale-105 border-purple-200"
                    } ${dragItem === brow.id ? "opacity-50 scale-95" : ""}`}
                    draggable={!isUsed}
                    onDragStart={(e) => handleDragStart(e, brow.id)}
                  >
                    <CardContent className="p-2 sm:p-3">
                      <div className="space-y-2">
                        <img
                          src={brow.image}
                          alt={brow.name}
                          className="w-full h-14 sm:h-16 lg:h-24 object-contain bg-white rounded p-1 border border-purple-100"
                        />
                        <div className="text-center">
                          <h3 className="text-xs font-medium text-purple-800 leading-tight">
                            {brow.name}
                          </h3>
                          {isUsed && (
                            <p className="text-xs text-gray-500 mt-1">Used</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>

        {/* End dialog */}
        <Dialog open={endOpen} onOpenChange={setEndOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-md mx-2 sm:mx-4">
            <DialogHeader>
              <DialogTitle className="text-center text-purple-900 text-lg sm:text-xl">
                {correctCount === FACES.length
                  ? "Perfect!"
                  : "Exercise complete!"}
              </DialogTitle>
            </DialogHeader>
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 sm:p-6 rounded-lg">
                <p className="text-base sm:text-lg mb-2">
                  You got{" "}
                  <span className="font-bold">{correctCount}</span> correct
                  answers out of {FACES.length}
                </p>
                {correctCount === FACES.length && (
                  <p className="text-xs sm:text-sm opacity-90">
                    Excellent work! You have mastered morphological analysis.
                  </p>
                )}
              </div>
              <Button
                onClick={handleReset}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white min-h-[44px] touch-manipulation px-6 py-3"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
