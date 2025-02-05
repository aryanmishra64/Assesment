import { useState, useEffect } from 'react';
import "../app/globals.css";

export default function Home() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/tasks');
            if (!res.ok) throw new Error("Failed to fetch tasks");
            const data = await res.json();
            setTasks(data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    const addTask = async () => {
        if (!newTask.trim()) return;
        setLoading(true);
        const newTaskData = { title: newTask, description: newDescription, status: "in-progress" };

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTaskData),
            });
            if (!res.ok) throw new Error("Failed to add task");
            fetchTasks(); // Refetch tasks after adding
        } catch (error) {
            console.error("Error adding task:", error);
        }
        setLoading(false);
        setNewTask('');
        setNewDescription('');
    };

    const deleteTask = async (taskId) => {
      if (!taskId) {
          console.error("Error: Task ID is undefined.");
          return;
      }
  
      try {
          const response = await fetch(`/api/tasks?id=${taskId}`, {
              method: 'DELETE',
          });
  
          if (!response.ok) {
              throw new Error("Failed to delete task");
          }
  
          // Close the popup and refetch tasks after deletion
          setShowPopup(false);  // Close the popup
          fetchTasks(); // Refetch the tasks
      } catch (error) {
          console.error("Error deleting task:", error);
      }
  };
  
  const updateTaskStatus = async (id, newStatus) => {
    if (!id) {
        console.error("Task ID is missing");
        return;
    }

    setLoading(true);
    try {
        const res = await fetch(`/api/tasks?id=${id}`, {  // Keep the same URL, just change the method to PUT
            method: 'PUT',  // Change PATCH to PUT
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });

        if (!res.ok) {
            throw new Error("Failed to update task status");
        }

        // Update tasks state manually instead of fetching again
        setTasks(prevTasks => 
            prevTasks.map(task => 
                task._id === id ? { ...task, status: newStatus } : task
            )
        );
    } catch (error) {
        console.error("Error updating task status:", error);
    }
    setLoading(false);
    setShowPopup(false);
};



    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setShowPopup(true);
    };

    const filteredTasks = tasks.filter(task => filter === 'all' || task.status === filter);

    return (
        <div className="container mx-auto p-5">
            <h1 className="text-2xl font-bold text-center mb-5">Task Manager</h1>

            {/* Task Input Fields */}
            <div className="flex gap-3 mb-5">
                <input 
                    type="text" 
                    placeholder="Task Title" 
                    value={newTask} 
                    onChange={(e) => setNewTask(e.target.value)} 
                    className="border p-2 w-full rounded"
                />
                <input 
                    type="text" 
                    placeholder="Description" 
                    value={newDescription} 
                    onChange={(e) => setNewDescription(e.target.value)} 
                    className="border p-2 w-full rounded"
                />
                <button 
                    onClick={addTask} 
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
                    {loading ? 'Adding...' : 'Add Task'}
                </button>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-3 mb-5">
                {['all', 'done', 'in-progress', 'under-review'].map((status) => (
                    <button 
                        key={status} 
                        className={`px-4 py-2 rounded ${filter === status ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => setFilter(status)}>
                        {status.replace('-', ' ')}
                    </button>
                ))}
            </div>

            {/* Task Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map((task) => (
                    <div 
                        key={task._id} 
                        onClick={() => handleTaskClick(task)}
                        className="bg-white p-4 rounded-lg shadow-md border hover:shadow-lg transition-all cursor-pointer">
                        <h2 className="font-bold text-lg">{task.title}</h2>
                        <p className="text-sm text-gray-600">{task.description}</p>
                        <span className={`text-xs px-3 py-1 rounded-full mt-2 inline-block ${
                            task.status === 'done' ? 'bg-green-500 text-white' :
                            task.status === 'in-progress' ? 'bg-yellow-500 text-white' :
                            'bg-red-500 text-white'
                        }`}>
                            {task.status.replace('-', ' ')}
                        </span>
                    </div>
                ))}
            </div>

            {/* Popup for Task Actions */}
            {showPopup && selectedTask && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-5 rounded-lg shadow-lg">
                        <h2 className="text-xl font-bold">{selectedTask.title}</h2>
                        <p className="text-gray-600">{selectedTask.description}</p>

                        {/* Task Status Update Buttons */}
                        <div className="flex gap-2 mt-4">
                            <button 
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
                                onClick={() => updateTaskStatus(selectedTask._id, 'done')}>
                                Mark as Done
                            </button>
                            <button 
                                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-700"
                                onClick={() => updateTaskStatus(selectedTask._id, 'in-progress')}>
                                Mark In Progress
                            </button>
                            <button 
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                                onClick={() => updateTaskStatus(selectedTask._id, 'under-review')}>
                                Under Review
                            </button>
                        </div>

                        {/* Delete & Close Buttons */}
                        <div className="flex gap-2 mt-4">
                            <button 
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
                                onClick={() => setShowPopup(false)}>
                                Cancel
                            </button>
                            <button 
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                                onClick={() => deleteTask(selectedTask._id)}>
                                Delete Task
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
