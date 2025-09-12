import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
    return (
        <>
            <PageMeta title="PH-Sklad" description="Sklad management system" />
            <AuthLayout>
                <SignInForm />
            </AuthLayout>
        </>
    );
}
