import User from '../models/userModel.js'

export var getUsers = async (req, res) => {

    try 
    {
        const users = await User.find();
        res.status(200).json(users);
    } 
    catch (error) 
    {
        res.status(404).json({ message: error.message});
    }
}

export const getUser = async (req, res) => {
    
    try
    {
        const upUser = await User.findById(req.params.id);
        res.status(201).json(upUser);

    }
    catch (error) 
    {
        res.status(404).json({ message: error.message});
    }
}

export const createUsers = async (req, res) => {
    const body = req.body;
    const newUser = new User(body);

    try 
    {
        await newUser.save();
        res.status(201).json(newUser);
    } 
    catch (error) 
    {
        res.status(404).json({ message: error.message});
    }
}

export const updateUser = async (req, res) => {

    try
    {
        await User.findByIdAndUpdate(req.params.id, 
            {
                first_name: req.body.first_name, 
                last_name: req.body.last_name, 
                adress: req.body.adress, 
                city: req.body.city, 
                tel: req.body.tel, 
                profil_picture: req.body.profil_picture, 
                email: req.body.email, 
                password: req.body.password, 
            });
    
        res.status(201).json('update : ' + req.params.id);
    }
    catch (error) 
    {
        res.status(404).json({ message: error.message});
    }
}

export const deleteUser = async (req, res) => {
    try
    {
        await User.findByIdAndDelete(req.params.id);
        res.status(201).json('supprimer : ' + req.params.id);
    }
    catch (error) 
    {
        res.status(404).json({ message: error.message});
    }
}