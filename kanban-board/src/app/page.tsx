"use client"; // Required for react-beautiful-dnd

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface Task {
  id: string;
  title: string;
  description: string;
}

// Helper function to reorder tasks within the same column
const reorder = (list: Task[], startIndex: number, endIndex: number): Task[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// Helper function to move tasks between columns
const move = (source: Task[], destination: Task[], droppableSource: any, droppableDestination: any): { [key: string]: Task[] } => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result: { [key: string]: Task[] } = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};


export default function KanbanPage() {
  const [mounted, setMounted] = useState(false);
  const [toDoTasks, setToDoTasks] = useState<Task[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([]);
  const [doneTasks, setDoneTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  // State for task editing
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditingTitle, setCurrentEditingTitle] = useState('');
  const [currentEditingDescription, setCurrentEditingDescription] = useState('');
  const [editingTaskColumnId, setEditingTaskColumnId] = useState<string | null>(null);


  useEffect(() => {
    // Load tasks from local storage on initial mount
    try {
      const storedToDo = localStorage.getItem('toDoTasks');
      const storedInProgress = localStorage.getItem('inProgressTasks');
      const storedDone = localStorage.getItem('doneTasks');

      if (storedToDo) setToDoTasks(JSON.parse(storedToDo));
      if (storedInProgress) setInProgressTasks(JSON.parse(storedInProgress));
      if (storedDone) setDoneTasks(JSON.parse(storedDone));
    } catch (error) {
      console.error("Failed to load tasks from local storage:", error);
      // Initialize with empty arrays if loading fails or no data found
      setToDoTasks([]);
      setInProgressTasks([]);
      setDoneTasks([]);
    }
    setMounted(true); // For react-beautiful-dnd
  }, []);

  // Save tasks to local storage whenever they change
  useEffect(() => {
    if (mounted) { // Only save after initial mount and load
      try {
        localStorage.setItem('toDoTasks', JSON.stringify(toDoTasks));
        localStorage.setItem('inProgressTasks', JSON.stringify(inProgressTasks));
        localStorage.setItem('doneTasks', JSON.stringify(doneTasks));
      } catch (error) {
        console.error("Failed to save tasks to local storage:", error);
      }
    }
  }, [toDoTasks, inProgressTasks, doneTasks, mounted]);

  const columnMap: { [key: string]: Task[] } = {
    todo: toDoTasks,
    inprogress: inProgressTasks,
    done: doneTasks,
  };

  const getColumnSetter = (columnId: string): React.Dispatch<React.SetStateAction<Task[]>> | undefined => {
    const setters: { [key: string]: React.Dispatch<React.SetStateAction<Task[]>> } = {
      todo: setToDoTasks,
      inprogress: setInProgressTasks,
      done: setDoneTasks,
    };
    return setters[columnId];
  };


  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`, // More robust unique ID
      title: newTaskTitle,
      description: newTaskDescription,
    };

    setToDoTasks([newTask, ...toDoTasks]); // Add to the beginning of the list
    setNewTaskTitle('');
    setNewTaskDescription('');
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    const sourceDroppableId = source.droppableId as keyof typeof columnMap;
    const destinationDroppableId = destination.droppableId as keyof typeof columnMap;

    if (sourceDroppableId === destinationDroppableId) {
      // Reordering within the same column
      const items = reorder(
        columnMap[sourceDroppableId],
        source.index,
        destination.index
      );
      const setter = getColumnSetter(sourceDroppableId);
      if (setter) setter(items);
    } else {
      // Moving between columns
      const moveResult = move(
        columnMap[sourceDroppableId],
        columnMap[destinationDroppableId],
        source,
        destination
      );
      const sourceSetter = getColumnSetter(sourceDroppableId);
      const destSetter = getColumnSetter(destinationDroppableId);
      if (sourceSetter) sourceSetter(moveResult[sourceDroppableId]);
      if (destSetter) destSetter(moveResult[destinationDroppableId]);
    }
  };

  const handleDeleteTask = (taskId: string, columnId: string) => {
    const setter = getColumnSetter(columnId);
    if (setter) {
      setter(prevTasks => deleteTaskFromList(prevTasks, taskId));
    }
  };

  const handleOpenEditModal = (task: Task, columnId: string) => {
    setEditingTask(task);
    setCurrentEditingTitle(task.title);
    setCurrentEditingDescription(task.description);
    setEditingTaskColumnId(columnId); // Corrected state variable name
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingTask || !editingTaskColumnId || !currentEditingTitle.trim()) {
      alert("Task title cannot be empty.");
      return;
    }

    const updatedTask: Task = {
      ...editingTask,
      title: currentEditingTitle,
      description: currentEditingDescription,
    };

    const setter = getColumnSetter(editingTaskColumnId);
    if (setter) {
      setter(prevTasks => updateTaskInList(prevTasks, updatedTask));
    }

    setShowEditModal(false);
    setEditingTask(null);
    setCurrentEditingTitle('');
    setCurrentEditingDescription('');
    setEditingTaskColumnId(null); // Corrected state variable name
  };
  
  if (!mounted) {
    // Render nothing or a loading indicator until the component is mounted
    // This is to avoid issues with server-side rendering and react-beautiful-dnd
    return null; 
  }

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 md:p-8 min-h-screen bg-slate-200 font-sans">
      <div className="w-full max-w-6xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-700">Kanban Board</h1>
        </header>

        {/* Task Creation Form */}
        <form onSubmit={handleAddTask} className="mb-10 p-6 bg-slate-50 rounded-xl shadow-xl transition-shadow hover:shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6 text-slate-700 text-center sm:text-left">Add New Task</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="sm:col-span-2">
              <label htmlFor="taskTitle" className="block text-sm font-medium text-slate-600 mb-1">Title</label>
              <input
                type="text"
                id="taskTitle"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out placeholder-slate-400"
                placeholder="e.g., Design homepage"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="taskDescription" className="block text-sm font-medium text-slate-600 mb-1">Description (Optional)</label>
              <textarea
                id="taskDescription"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out placeholder-slate-400"
                placeholder="e.g., Draft initial mockups and gather feedback"
                rows={4}
              />
            </div>
            <button
              type="submit"
              className="sm:col-span-2 w-full bg-sky-600 text-white py-3 px-5 rounded-lg font-semibold hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75 transition duration-150 ease-in-out shadow-md hover:shadow-lg"
            >
              Add Task
            </button>
          </div>
        </form>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {Object.entries({
              todo: { name: "To Do", tasks: toDoTasks, color: "bg-rose-500" },
              inprogress: { name: "In Progress", tasks: inProgressTasks, color: "bg-amber-500" },
              done: { name: "Done", tasks: doneTasks, color: "bg-emerald-500" },
            }).map(([columnId, columnData]) => (
              <Droppable key={columnId} droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex flex-col bg-slate-100 p-5 rounded-xl shadow-lg transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-sky-100' : 'bg-slate-100'}`}
                  >
                    <div className={`flex items-center justify-between mb-5 p-3 rounded-t-md text-white ${columnData.color}`}>
                      <h2 className="text-xl font-semibold">{columnData.name}</h2>
                      <span className="text-lg font-medium bg-white/30 rounded-full px-3 py-1">
                        {columnData.tasks.length}
                      </span>
                    </div>
                    <div className="space-y-4 min-h-[250px] overflow-y-auto p-1 custom-scrollbar">
                      {columnData.tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white p-4 rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition-shadow duration-150 ease-in-out ${snapshot.isDragging ? 'ring-2 ring-sky-500 shadow-xl' : ''}`}
                              style={{
                                ...provided.draggableProps.style,
                              }}
                            >
                              <h3 className="font-semibold text-slate-800 mb-1 break-words">{task.title}</h3>
                              {task.description && <p className="text-sm text-slate-600 whitespace-pre-wrap break-words mb-3">{task.description}</p>}
                              <div className="mt-3 pt-3 border-t border-slate-200 flex justify-end space-x-2">
                                <button
                                  onClick={() => handleOpenEditModal(task, columnId)}
                                  className="text-xs font-medium text-slate-600 hover:text-sky-600 py-1 px-3 rounded-md hover:bg-sky-100 transition-all duration-150"
                                  aria-label="Edit task"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id, columnId)}
                                  className="text-xs font-medium text-slate-600 hover:text-rose-600 py-1 px-3 rounded-md hover:bg-rose-100 transition-all duration-150"
                                  aria-label="Delete task"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Edit Task Modal */}
      {showEditModal && editingTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-slate-50 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-out scale-95 opacity-0 animate-modal-appear">
            <h2 className="text-2xl font-semibold mb-6 text-slate-700">Edit Task</h2>
            <div className="space-y-5">
              <div>
                <label htmlFor="editTaskTitle" className="block text-sm font-medium text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  id="editTaskTitle"
                  value={currentEditingTitle}
                  onChange={(e) => setCurrentEditingTitle(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out placeholder-slate-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="editTaskDescription" className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                <textarea
                  id="editTaskDescription"
                  value={currentEditingDescription}
                  onChange={(e) => setCurrentEditingDescription(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out placeholder-slate-400"
                  rows={5}
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors duration-150 ease-in-out"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2.5 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75 transition-colors duration-150 ease-in-out shadow-sm hover:shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to update a task in a list
const updateTaskInList = (tasks: Task[], updatedTask: Task): Task[] => {
  return tasks.map(task => task.id === updatedTask.id ? updatedTask : task);
};

// Helper function to delete a task from a list
const deleteTaskFromList = (tasks: Task[], taskIdToDelete: string): Task[] => {
  return tasks.filter(task => task.id !== taskIdToDelete);
};
