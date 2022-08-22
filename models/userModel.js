import mongoose from "mongoose";

const userSchema = mongoose.Schema({

    "first_name": String,
    "last_name": String,
    "adress": String,
    "city": String,
    "tel": String,
    "profil_picture": String,
    "email": String,
    "password": String,
});

const User = mongoose.model('users', userSchema);

export default User;