/**
 * MELLOWISE-018: Logic Games Deep Practice Module
 * Interactive Game Board Component with Drag-and-Drop Support
 *
 * @epic Epic 3.2 - Comprehensive LSAT Question System
 * @author Dev Agent Marcus (BMad Team) + UX Expert Aria
 * @created 2025-09-19
 * @dependencies DnD Kit, React Sketch Canvas, Logic Games types
 */

'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  TouchSensor,
  KeyboardSensor,
  useDroppable,
  useDraggable,
  rectIntersection,
  pointerWithin,
  CollisionDetection,
  getFirstCollision
} from '@dnd-kit/core'
import {
  useSortable,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import type {
  LogicGameQuestion,
  GameBoardState,
  GameEntity,
  GamePosition,
  UserAction,
  ValidationResult,
  BoardAnnotation,
  GameBoardConfig
} from '@/types/logic-games'

// Dynamic import for React Sketch Canvas to avoid SSR issues
const ReactSketchCanvas = dynamic(
  () => import('react-sketch-canvas').then(mod => mod.ReactSketchCanvas),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />
  }
)

interface GameBoardProps {
  question: LogicGameQuestion
  initialState?: GameBoardState
  onStateChange?: (state: GameBoardState) => void
  onUserAction?: (action: UserAction) => void
  readOnly?: boolean
  showHints?: boolean
  className?: string
}

interface DraggedEntity {
  id: string
  entity: GameEntity
  sourcePosition?: string
}

export function GameBoard({
  question,
  initialState,
  onStateChange,
  onUserAction,
  readOnly = false,
  showHints = true,
  className
}: GameBoardProps) {
  // Sensors for drag and drop interactions
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum drag distance to activate
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Component state
  const [boardState, setBoardState] = useState<GameBoardState>(
    initialState || createInitialBoardState(question)
  )
  const [draggedEntity, setDraggedEntity] = useState<DraggedEntity | null>(null)
  const [annotations, setAnnotations] = useState<BoardAnnotation[]>(
    initialState?.annotations || []
  )
  const [showAnnotations, setShowAnnotations] = useState(true)
  const [selectedTool, setSelectedTool] = useState<'drag' | 'draw' | 'text'>('drag')
  const [sketchPaths, setSketchPaths] = useState<any[]>([])

  // Refs for canvas and board dimensions
  const boardRef = useRef<HTMLDivElement>(null)
  const sketchCanvasRef = useRef<any>(null)

  // Custom collision detection that prioritizes chair positions over entity-bank
  const customCollisionDetection: CollisionDetection = useCallback((args) => {
    // First, get all collisions using rect intersection
    const rectCollisions = rectIntersection(args)

    if (rectCollisions.length === 0) {
      return []
    }

    // Filter for chair position collisions (pos1, pos2, etc.)
    const chairCollisions = rectCollisions.filter(collision =>
      typeof collision.id === 'string' && collision.id.startsWith('pos')
    )

    // If we have chair position collisions, prioritize them
    if (chairCollisions.length > 0) {
      return [chairCollisions[0]] // Return the first chair position collision
    }

    // Otherwise, return the entity-bank or other collisions
    return [rectCollisions[0]]
  }, [])

  // Update parent when board state changes
  useEffect(() => {
    onStateChange?.(boardState)
  }, [boardState, onStateChange])

  // Canvas stays mounted, so no need to restore paths on visibility toggle

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (readOnly) return

    const { active } = event
    const activeId = active.id as string

    // Handle both fresh entities and placed entities
    const entityId = activeId.startsWith('placed_') ? activeId.substring(7) : activeId
    const entity = question.game_setup.entities.find(e => e.id === entityId)

    if (entity) {
      const sourcePosition = Object.entries(boardState.entity_positions)
        .find(([eId]) => eId === entityId)?.[1]

      setDraggedEntity({
        id: entityId,
        entity,
        sourcePosition
      })

      // If dragging a placed entity, temporarily remove it from the board
      if (activeId.startsWith('placed_') && sourcePosition) {
        const newEntityPositions = { ...boardState.entity_positions }
        delete newEntityPositions[entityId]

        setBoardState(prev => ({
          ...prev,
          entity_positions: newEntityPositions,
          timestamp: new Date().toISOString()
        }))
      }

      // Record user action
      onUserAction?.({
        timestamp: new Date().toISOString(),
        action_type: 'entity_movement',
        entity_id: entityId,
        source_position: sourcePosition
      })
    }
  }, [readOnly, question.game_setup.entities, boardState.entity_positions, onUserAction])

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    if (readOnly) return

    const { active, over } = event
    const draggedEntityInfo = draggedEntity
    setDraggedEntity(null)

    // Get valid droppable IDs
    const validDropIds = [
      'entity-bank',
      ...question.game_setup.positions.map(p => p.id)
    ]

    // If no drop target OR dropped on invalid area, return to entity bank
    if (!over || !validDropIds.includes(over.id as string)) {
      // If it was a placed entity, remove it from the board and return to bank
      if (draggedEntityInfo?.sourcePosition) {
        const newEntityPositions = { ...boardState.entity_positions }
        delete newEntityPositions[draggedEntityInfo.id]

        const newBoardState: GameBoardState = {
          ...boardState,
          entity_positions: newEntityPositions,
          timestamp: new Date().toISOString(),
          validation_status: validateBoardState(newEntityPositions, question),
          completion_percentage: calculateCompletionPercentage(newEntityPositions, question)
        }

        setBoardState(newBoardState)

        // Record user action
        onUserAction?.({
          timestamp: new Date().toISOString(),
          action_type: 'entity_movement',
          entity_id: draggedEntityInfo.id,
          source_position: draggedEntityInfo.sourcePosition,
          target_position: 'entity_bank'
        })
      }
      return
    }

    if (!draggedEntityInfo) return

    const entityId = draggedEntityInfo.id
    const targetId = over.id as string

    // Check if dropped on entity bank area (remove from board)
    if (targetId === 'entity-bank') {
      const newEntityPositions = { ...boardState.entity_positions }
      delete newEntityPositions[entityId]

      const newBoardState: GameBoardState = {
        ...boardState,
        entity_positions: newEntityPositions,
        timestamp: new Date().toISOString(),
        validation_status: validateBoardState(newEntityPositions, question),
        completion_percentage: calculateCompletionPercentage(newEntityPositions, question)
      }

      setBoardState(newBoardState)

      // Record user action
      onUserAction?.({
        timestamp: new Date().toISOString(),
        action_type: 'entity_movement',
        entity_id: entityId,
        source_position: draggedEntityInfo.sourcePosition,
        target_position: 'entity_bank'
      })
      return
    }

    // Check if dropping on same position (no-op)
    if (draggedEntityInfo.sourcePosition === targetId) {
      setBoardState(prev => ({
        ...prev,
        entity_positions: {
          ...prev.entity_positions,
          [entityId]: targetId
        },
        timestamp: new Date().toISOString()
      }))
      return
    }

    // Validate the move to a position
    const validationResult = validateEntityPlacement(
      entityId,
      targetId,
      question,
      boardState
    )

    if (validationResult.isValid) {
      // Update entity positions
      const newEntityPositions = {
        ...boardState.entity_positions,
        [entityId]: targetId
      }

      // Create new board state
      const newBoardState: GameBoardState = {
        ...boardState,
        entity_positions: newEntityPositions,
        timestamp: new Date().toISOString(),
        validation_status: validateBoardState(newEntityPositions, question),
        completion_percentage: calculateCompletionPercentage(newEntityPositions, question)
      }

      setBoardState(newBoardState)

      // Record successful user action
      onUserAction?.({
        timestamp: new Date().toISOString(),
        action_type: 'entity_placement',
        entity_id: entityId,
        target_position: targetId
      })
    } else {
      // Invalid placement - restore to original position if it was placed
      if (draggedEntityInfo.sourcePosition) {
        setBoardState(prev => ({
          ...prev,
          entity_positions: {
            ...prev.entity_positions,
            [entityId]: draggedEntityInfo.sourcePosition!
          },
          timestamp: new Date().toISOString()
        }))
      }

      // Show validation error to user
      console.warn('Invalid placement:', validationResult.reason)
      // Could add toast notification here
    }
  }, [readOnly, question, boardState, draggedEntity, onUserAction])

  // Handle annotation drawing - export paths whenever canvas updates
  const handleAnnotationUpdate = useCallback(() => {
    if (readOnly || selectedTool !== 'draw') return

    // Use a small debounce to avoid excessive exports
    const timer = setTimeout(() => {
      if (sketchCanvasRef.current) {
        sketchCanvasRef.current.exportPaths()
          .then((data: any[]) => {
            setSketchPaths(data)

            // Only create annotation record if this is a new addition
            if (data.length > sketchPaths.length) {
              const newAnnotation: BoardAnnotation = {
                id: `annotation_${Date.now()}`,
                type: 'line',
                start_position: { x: 0, y: 0 },
                style: {
                  color: '#3b82f6',
                  thickness: 2,
                  opacity: 0.8
                },
                created_at: new Date().toISOString()
              }

              setAnnotations(prev => [...prev, newAnnotation])

              // Update board state
              setBoardState(prev => ({
                ...prev,
                annotations: [...prev.annotations, newAnnotation],
                timestamp: new Date().toISOString()
              }))

              onUserAction?.({
                timestamp: new Date().toISOString(),
                action_type: 'annotation_created',
                annotation_id: newAnnotation.id
              })
            }
          })
          .catch((error: any) => {
            console.warn('Failed to export paths:', error)
          })
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [readOnly, selectedTool, sketchPaths.length, onUserAction])

  // Clear all annotations
  const clearAnnotations = useCallback(() => {
    if (readOnly) return

    setAnnotations([])
    setSketchPaths([])
    setBoardState(prev => ({
      ...prev,
      annotations: [],
      timestamp: new Date().toISOString()
    }))

    sketchCanvasRef.current?.clearCanvas()
  }, [readOnly])

  // Reset board to initial state
  const resetBoard = useCallback(() => {
    if (readOnly) return

    const initialBoardState = createInitialBoardState(question)
    setBoardState(initialBoardState)
    setAnnotations([])
    setSketchPaths([])
    sketchCanvasRef.current?.clearCanvas()
  }, [readOnly, question])

  // Render game entities (draggable)
  const renderEntity = (entity: GameEntity, isOverlay = false) => {
    const position = boardState.entity_positions[entity.id]
    const isPlaced = !!position

    return (
      <div
        key={entity.id}
        className={cn(
          'entity-card',
          'flex items-center justify-center',
          'px-3 py-2 rounded-lg shadow-sm border-2',
          'text-sm font-medium cursor-grab active:cursor-grabbing',
          'transition-all duration-200',
          {
            'bg-blue-100 border-blue-300 text-blue-800': entity.type === 'person',
            'bg-green-100 border-green-300 text-green-800': entity.type === 'object',
            'bg-yellow-100 border-yellow-300 text-yellow-800': entity.type === 'event',
            'bg-purple-100 border-purple-300 text-purple-800': entity.type === 'attribute',
            'opacity-50': isPlaced && !isOverlay,
            'shadow-lg scale-105': isOverlay,
            'cursor-not-allowed': readOnly
          }
        )}
        style={{
          width: question.game_board_config.entity_styling.size.width,
          height: question.game_board_config.entity_styling.size.height,
          backgroundColor: entity.color || undefined
        }}
      >
        {entity.name}
      </div>
    )
  }

  // Render game positions (droppable)
  const renderPosition = (position: GamePosition) => {
    const placedEntity = Object.entries(boardState.entity_positions)
      .find(([_, posId]) => posId === position.id)?.[0]
    const entity = placedEntity
      ? question.game_setup.entities.find(e => e.id === placedEntity)
      : null

    return (
      <div
        key={position.id}
        className={cn(
          'position-slot',
          'border-2 border-dashed border-gray-300',
          'rounded-lg flex items-center justify-center',
          'transition-all duration-200',
          'min-h-[60px]',
          {
            'border-blue-400 bg-blue-50': draggedEntity && !entity,
            'bg-gray-50': !entity,
            'bg-white border-solid': entity
          }
        )}
        style={{
          width: question.game_board_config.position_styling.size.width,
          height: question.game_board_config.position_styling.size.height
        }}
      >
        {entity ? (
          renderEntity(entity)
        ) : (
          <div className="text-gray-400 text-xs text-center p-2">
            {position.name}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('logic-game-board', 'w-full h-full', className)}>
      {/* Game Board Header */}
      <div className="board-header flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">
            {question.game_type.replace('_', ' ').toUpperCase()} Game
          </h3>
          <div className="text-sm text-gray-600">
            {Math.round(boardState.completion_percentage)}% Complete
          </div>
        </div>

        {!readOnly && (
          <div className="flex items-center space-x-2">
            {/* Tool Selection */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedTool('drag')}
                className={cn(
                  'px-3 py-1 rounded text-sm font-medium transition-colors',
                  selectedTool === 'drag'
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                Drag
              </button>
              <button
                onClick={() => setSelectedTool('draw')}
                className={cn(
                  'px-3 py-1 rounded text-sm font-medium transition-colors',
                  selectedTool === 'draw'
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                Draw
              </button>
            </div>

            {/* Board Controls */}
            <button
              onClick={() => setShowAnnotations(!showAnnotations)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
            >
              {showAnnotations ? 'Hide' : 'Show'} Notes
            </button>
            <button
              onClick={clearAnnotations}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear Notes
            </button>
            <button
              onClick={resetBoard}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Main Game Board Area */}
      <div ref={boardRef} className="relative flex-1 p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={customCollisionDetection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[]}
        >
          <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 3fr' }}>
            {/* Entity Bank */}
            <EntityBankDropZone>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Game Entities
                </h4>
                <span className="text-xs text-gray-500">
                  {question.game_setup.entities.length - Object.keys(boardState.entity_positions).length} / {question.game_setup.entities.length}
                </span>
              </div>

              <div className="space-y-2 min-h-[200px]">
                {question.game_setup.entities.map(entity => (
                  !boardState.entity_positions[entity.id] && (
                    <DraggableEntity
                      key={entity.id}
                      entity={entity}
                      disabled={readOnly}
                    />
                  )
                ))}

                {/* Show instructions */}
                {!draggedEntity && Object.keys(boardState.entity_positions).length === 0 && (
                  <div className="text-xs text-gray-500 text-center py-4 italic">
                    <div>Drag entities to chair positions</div>
                    <div className="mt-1">Double-click or drag to box to remove</div>
                  </div>
                )}

                {/* Show drop hint when dragging */}
                {draggedEntity && draggedEntity.sourcePosition && (
                  <div className="text-xs text-green-600 text-center py-4 border-2 border-dashed border-green-300 rounded bg-green-50 font-medium">
                    ↑ Drop here to remove from board
                  </div>
                )}
              </div>
            </EntityBankDropZone>

            {/* Game Board Layout */}
            <div className="game-layout relative">
              {/* Position Grid */}
              <div className={cn(
                'positions-grid',
                {
                  'grid grid-cols-4 gap-4': question.game_board_config.board_type === 'grid_layout',
                  'flex space-x-4': question.game_board_config.board_type === 'linear_sequence',
                  'grid grid-cols-3 gap-4': question.game_board_config.board_type === 'circular_table'
                }
              )}>
                  {question.game_setup.positions.map(position => {
                    const placedEntityId = Object.entries(boardState.entity_positions)
                      .find(([_, posId]) => posId === position.id)?.[0]
                    const placedEntity = placedEntityId
                      ? question.game_setup.entities.find(e => e.id === placedEntityId)
                      : undefined

                    return (
                      <DroppablePosition
                        key={position.id}
                        position={position}
                        entity={placedEntity}
                        onEntityRemove={readOnly ? undefined : (entityId) => {
                          const newEntityPositions = { ...boardState.entity_positions }
                          delete newEntityPositions[entityId]

                          const newBoardState: GameBoardState = {
                            ...boardState,
                            entity_positions: newEntityPositions,
                            timestamp: new Date().toISOString(),
                            validation_status: validateBoardState(newEntityPositions, question),
                            completion_percentage: calculateCompletionPercentage(newEntityPositions, question)
                          }

                          setBoardState(newBoardState)

                          onUserAction?.({
                            timestamp: new Date().toISOString(),
                            action_type: 'entity_movement',
                            entity_id: entityId,
                            source_position: position.id
                          })
                        }}
                      />
                    )
                  })}
              </div>

              {/* Annotation Layer - Always mounted but visibility controlled */}
              <div
                className="absolute inset-0"
                style={{
                  pointerEvents: selectedTool === 'draw' && showAnnotations ? 'auto' : 'none',
                  opacity: showAnnotations ? 1 : 0,
                  transition: 'opacity 0.2s ease-in-out'
                }}
              >
                <ReactSketchCanvas
                  ref={sketchCanvasRef}
                  style={{
                    border: 'none',
                    background: 'transparent'
                  }}
                  width={boardRef.current?.offsetWidth || 600}
                  height={boardRef.current?.offsetHeight || 400}
                  strokeWidth={2}
                  strokeColor="#3b82f6"
                  canvasColor="transparent"
                  allowPointers={selectedTool === 'draw' && showAnnotations ? 'all' : 'none'}
                  readOnly={readOnly || selectedTool !== 'draw' || !showAnnotations}
                  onUpdate={handleAnnotationUpdate}
                />
              </div>
            </div>
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {draggedEntity ? renderEntity(draggedEntity.entity, true) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Validation Status */}
      {boardState.validation_status && (
        <div className="board-footer p-4 border-t bg-gray-50">
          <ValidationDisplay validation={boardState.validation_status} />
        </div>
      )}
    </div>
  )
}

// Helper Components
function EntityBankDropZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'entity-bank'
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'entity-bank p-4 rounded-lg border-2 transition-all duration-200',
        {
          'border-green-400 bg-green-50': isOver,
          'border-gray-200 bg-gray-50': !isOver
        }
      )}
    >
      {children}
    </div>
  )
}

function DraggableEntity({ entity, disabled }: { entity: GameEntity; disabled: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: entity.id,
    disabled
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none' // Prevent touch scrolling during drag
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'entity-item',
        'flex items-center justify-center',
        'px-3 py-2 rounded-lg shadow-sm border-2',
        'text-sm font-medium cursor-grab active:cursor-grabbing',
        'transition-all duration-200',
        'bg-blue-100 border-blue-300 text-blue-800',
        {
          'cursor-not-allowed opacity-50': disabled,
          'hover:shadow-md hover:scale-105': !disabled
        }
      )}
      data-entity-id={entity.id}
    >
      {entity.name}
    </div>
  )
}

function DroppablePosition({
  position,
  entity,
  onEntityRemove
}: {
  position: GamePosition;
  entity?: GameEntity;
  onEntityRemove?: (entityId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: position.id
  })


  return (
    <div
      ref={setNodeRef}
      className={cn(
        'position-slot border-2 rounded-lg p-4',
        'min-h-[100px] flex items-center justify-center',
        'transition-all duration-200',
        {
          'border-blue-400 bg-blue-50 scale-105': isOver,
          'border-dashed border-gray-300 bg-gray-50': !isOver && !entity,
          'border-solid border-gray-400 bg-white': entity
        }
      )}
      style={{
        width: '140px',
        height: '90px',
        margin: '4px'
      }}
    >
      {entity ? (
        <PlacedEntity
          entity={entity}
          onRemove={onEntityRemove ? () => onEntityRemove(entity.id) : undefined}
        />
      ) : (
        <div className="text-xs text-gray-400 text-center">
          {position.name}
        </div>
      )}
    </div>
  )
}

function PlacedEntity({
  entity,
  onRemove
}: {
  entity: GameEntity;
  onRemove?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: `placed_${entity.id}`,
    disabled: !onRemove
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'placed-entity-card',
        'flex items-center justify-center',
        'px-2 py-1 rounded shadow-sm border-2',
        'text-sm font-medium',
        'transition-all duration-200',
        'w-full h-full cursor-grab active:cursor-grabbing',
        {
          'bg-blue-100 border-blue-300 text-blue-800': entity.type === 'person',
          'bg-green-100 border-green-300 text-green-800': entity.type === 'object',
          'bg-yellow-100 border-yellow-300 text-yellow-800': entity.type === 'event',
          'bg-purple-100 border-purple-300 text-purple-800': entity.type === 'attribute',
          'cursor-default': !onRemove
        }
      )}
      title={onRemove ? `Double-click to remove ${entity.name}` : entity.name}
      onDoubleClick={onRemove}
    >
      <span className="truncate">{entity.name}</span>
    </div>
  )
}

function ValidationDisplay({ validation }: { validation: ValidationResult }) {
  return (
    <div className="validation-display">
      <div className="flex items-center space-x-4">
        <div className={cn(
          'flex items-center space-x-2',
          validation.is_valid ? 'text-green-600' : 'text-red-600'
        )}>
          <div className={cn(
            'w-2 h-2 rounded-full',
            validation.is_valid ? 'bg-green-500' : 'bg-red-500'
          )} />
          <span className="text-sm font-medium">
            {validation.is_valid ? 'Valid Configuration' : 'Rule Violations'}
          </span>
        </div>

        {validation.violated_rules.length > 0 && (
          <div className="text-sm text-gray-600">
            {validation.violated_rules.length} rule(s) violated
          </div>
        )}
      </div>

      {validation.violated_rules.length > 0 && (
        <div className="mt-2 space-y-1">
          {validation.violated_rules.slice(0, 3).map((rule, index) => (
            <div key={index} className="text-xs text-red-600">
              • {rule.explanation}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Utility Functions
function createInitialBoardState(question: LogicGameQuestion): GameBoardState {
  return {
    timestamp: new Date().toISOString(),
    entity_positions: {},
    annotations: [],
    user_notes: '',
    validation_status: {
      is_valid: true,
      satisfied_rules: [],
      violated_rules: [],
      missing_assignments: question.game_setup.entities.map(e => e.id),
      conflicting_assignments: []
    },
    completion_percentage: 0,
    rules_satisfied: [],
    rules_violated: [],
    next_suggested_actions: [`Place ${question.game_setup.entities[0]?.name || 'first entity'}`]
  }
}

function validateEntityPlacement(
  entityId: string,
  positionId: string,
  question: LogicGameQuestion,
  currentState: GameBoardState
): { isValid: boolean; reason?: string } {
  // Check if position is already occupied
  const occupyingEntity = Object.entries(currentState.entity_positions)
    .find(([_, posId]) => posId === positionId)?.[0]

  if (occupyingEntity && occupyingEntity !== entityId) {
    return { isValid: false, reason: 'Position already occupied' }
  }

  // Check position capacity and restrictions
  const position = question.game_setup.positions.find(p => p.id === positionId)
  if (!position) {
    return { isValid: false, reason: 'Invalid position' }
  }

  // Additional rule-based validation would go here
  // For now, allow all placements
  return { isValid: true }
}

function validateBoardState(
  entityPositions: Record<string, string>,
  question: LogicGameQuestion
): ValidationResult {
  // Simplified validation - would implement full rule checking
  const placedEntities = Object.keys(entityPositions).length
  const totalEntities = question.game_setup.entities.length

  return {
    is_valid: placedEntities <= totalEntities,
    satisfied_rules: [],
    violated_rules: [],
    missing_assignments: question.game_setup.entities
      .filter(e => !entityPositions[e.id])
      .map(e => e.id),
    conflicting_assignments: []
  }
}

function calculateCompletionPercentage(
  entityPositions: Record<string, string>,
  question: LogicGameQuestion
): number {
  const placedCount = Object.keys(entityPositions).length
  const totalCount = question.game_setup.entities.length
  return totalCount > 0 ? (placedCount / totalCount) * 100 : 0
}

export default GameBoard