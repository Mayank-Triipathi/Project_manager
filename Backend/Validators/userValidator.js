const { z } = required("zod")

const LoginValidation = z.object({
    email: z.string().email(),
    password: z.string().min(8),
})

const RegisterValidation = LoginValidation.extend({
    fullname: z.string().min(3).max(100),
    username: z.string().min(3).max(30),
})


module.exports = { RegisterValidation, LoginValidation }