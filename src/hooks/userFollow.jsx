import toast from "react-hot-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"

const usefollow = () => {

    const queryclient = useQueryClient();

    const { mutate: follow, isPeding, error } = useMutation({
        mutationFn: async (userId) => {

            try {
                const res = await fetch(`/api/users/follow/${userId}`, {
                    method: "POSt",

                }
                )
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "something went wrong");

                }
                return data;
            } catch (error) {
                throw new Error(error)
            }

        },
        onSuccess: () => {
            Promise.all([
                queryclient.invalidateQueries({ queryKey: ["suggestedUser"] }),
                queryclient.invalidateQueries({ queryKey: ["authUser"] })

            ])

        },
        onError: () => {
            toast.error(error.message)
        }
    })
    return { follow, isPeding }
}
export default usefollow