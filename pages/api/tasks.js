import { connectToDatabase } from '../../lib/db';
import Task from '../../model/Task';

export default async function handler(req, res) {
    await connectToDatabase();
    const { method } = req;
    const { id } = req.query;

    try {
        switch (method) {
            case 'GET':
                const tasks = await Task.find({});
                return res.status(200).json(tasks);

            case 'POST':
                const newTask = await Task.create(req.body);
                return res.status(201).json(newTask);

            case 'PUT':
                if (!id) return res.status(400).json({ error: 'Task ID is required' });
                const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true });
                return res.status(200).json(updatedTask);

            case 'DELETE':
                if (!id) return res.status(400).json({ error: 'Task ID is required' });
                await Task.findByIdAndDelete(id);
                return res.status(204).send();

            default:
                return res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
