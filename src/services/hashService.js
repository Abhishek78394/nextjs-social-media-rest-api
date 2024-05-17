import bcrypt from "bcrypt";

const bcryptUtils = {
  async hashPwd(pass) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pass, salt);
    return hash;
  },

  async comparePwd(pass, dbPass) {
    const comparePass = await bcrypt.compare(pass, dbPass);
    return comparePass;
  }
};

module.exports = bcryptUtils;
