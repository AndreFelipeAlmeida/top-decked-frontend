    import { login } from '@/services/loginService'
    import { useMutation } from '@tanstack/react-query'

    export const useLogin = () => {
        return useMutation({
            mutationFn: ({ username, password }: { username: string; password: string }) =>
                login(username, password),
        })
    }   