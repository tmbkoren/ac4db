import { loginWithDiscord } from "./actions";

export default function LoginPage() {
    return (
        <form>
            <button formAction={loginWithDiscord}>Login with Discord</button>
        </form>
    )
}