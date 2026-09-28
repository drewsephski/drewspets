import { submitPublicForm } from "@/lib/server/public-forms"
export const POST = (request: Request) => submitPublicForm(request, "booking")
