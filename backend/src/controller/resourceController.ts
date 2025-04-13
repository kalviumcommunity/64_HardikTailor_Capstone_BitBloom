import { Request, Response , RequestHandler} from 'express';
import Resource from '../models/Resource';
import mongoose from 'mongoose';



export const createResource = async (req: Request, res: Response) => {
  try {
    const { title, description, isFree, price } = req.body;

    const newResource = new Resource({
      title,
      description,
      isFree,
      price: isFree ? undefined : price, // skip price if it's free
      // file: will be added when we do upload
      user: req.user?.id,
      
    }); 

    const savedResource = await newResource.save();
    res.status(201).json(savedResource);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create resource', error });
  }
};


export const getResources = async (req: Request, res: Response) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 }).populate('user', 'username email');
    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch resources', error });
  }
};

export const getResourceById = async (req: Request, res: Response): Promise<Response | undefined> => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid resource ID' });
    }
    const resource = await Resource.findById(id).populate('user', 'username email');
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.status(200).json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resource', error });
  }
};


export const updateResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedResource = await Resource.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedResource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.status(200).json(updatedResource);
  } catch (error) {
    console.error("Error updating resource:", error);
    res.status(500).json({ message: "Server error" });
  }
}; 




export const deleteResource = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    await Resource.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Error deleting resource:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};