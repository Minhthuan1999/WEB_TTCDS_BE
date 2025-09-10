const User = require("../models/userModel");
const Role = require("../models/roleModel");
const bcrypt = require("bcryptjs");
const fs = require("fs");

class UserController {
  async getAllUsers(req, res) {
    try {
      const users = await User.getAll();
      res.json(users);
    } catch (error) {
      console.error("Lỗi: ", error);
      res.status(500).json({ message: "Có lỗi xảy ra" });
    }
  }

  async getUserById(req, res) {
    try {
      const user = await User.getById(req.params.id);
      res.json(user);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Không tìm thấy" });
    }
  }

  async createUser(req, res) {
    try {
      var { username, password, email, roleID } = req.body;
      // const user_ID = Math.floor(Math.random() * 9000000) + 10000000;
      const msg = {};

      /* Check validation */
      if (username === "") {
        msg.username = "Vui lòng điền vào trường họ tên";
      }
      if (password === "") {
        msg.password = "Vui lòng điền vào trường mật khẩu";
      }


      if (Object.keys(msg).length > 0) {
        res.json({
          error: true,
          message: msg,
        });
      } else {
        password = await bcrypt.hashSync(password, 10);
        const user = await User.create({
          username,
          password,
          email,
          roleID
        });

        res.status(200).json({
          success: true,
          message: "Tạo tài khoản thành công!",
        });
      }
    } catch (error) {
      if(error.code === 'ER_DUP_ENTRY'){
        return res.status(500).json({message: 'Email đã tồn tại'})
      } else {
        console.log(error)
        res.status(500).json({ message: "Tạo người dùng thất bại" });
      }
    }
  }

  async updateUser(req, res) {
    try {

      var { username, email, newPassword, roleID } = req.body;
            
      const user = await User.getById(req.params.id);

      if(newPassword !== '') {
        newPassword = await bcrypt.hashSync(newPassword, 10);
      }

      const data = {
        username: username,
        email: email,
        password: newPassword !== '' ? newPassword : user.password,
        roleID: roleID
      };

      const updatedRows = await User.update(req.params.id, data);

      res.json({
        success: true,
        message: "Cập nhật thành công!",
        status: updatedRows.message,
      });
    } catch (error) {
      if(error.code === 'ER_DUP_ENTRY'){
        return res.status(500).json({message: 'Email đã tồn tại'})
      } else {
        console.log(error); 
        res.status(500).json({ success: false, message: "Đã xảy ra lỗi" });
      }
    }
  }


  async updateProfile(req, res) {
    try {

      var { username, email, phone, address, flagRemoveImage } = req.body;
            
      const user = await User.getById(req.params.id);

      
      if ((req.file && user.avatar !== null) || flagRemoveImage === "false") {
        fs.unlink(`uploads/${user.avatar}`, (err) => {
          if (err) console.log(err);
        });
      }    

      const data = {
        username: username,
        email: email,
        phone: phone,
        address: address,
        avatar:
          flagRemoveImage === "false"
            ? null
            : req.file
            ? req.file.filename
            : user.avatar,  
      };

      const updatedRows = await User.update(req.params.id, data);

      res.json({
        success: true,
        message: "Cập nhật thành công!",
        status: updatedRows.message,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({ success: false, message: "Đã xảy ra lỗi" });
    }
  }



  async deleteUser(req, res) {
    try {
      await User.delete(req.params.id);
      res.json({ success: true, message: "Xóa thành công" });
    } catch (error) {
      console.error("Lỗi: ", error);
      res.status(500).json({ message: "Có lỗi xảy ra" });
    }
  }

  async changePassword(req, res) {

    const user = await User.getById(req.params.id);


    const { oldPassword, newPassword, confirmPassword } = req.body;

    const isPasswordMatched = await User.comparePassword(
      oldPassword,
      user.password
    );

    if (!isPasswordMatched) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu cũ không chính xác"
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới không khớp"
      });
    } else {
      bcrypt.hash(newPassword, 10, (err, hashedNewPassword) => {
        if (err) throw err;
        User.updatePassword(req.params.id, hashedNewPassword);

        return res.status(200).json({
          success: true,
          message: "Đổi mật khẩu thành công"
        });
      });
    }
  }

  //roles function
  async getRoleList(req, res) {
    try {
      const roles = await Role.getAll();
      res.json(roles);
    } catch (error) {
      console.error("Lỗi: ", error);
      res.status(500).json({ message: "Có lỗi xảy ra" });
    }
  }
}

module.exports = new UserController();
