import {ConfigProvider} from "antd";
import {SessionProvider, signIn, useSession} from "next-auth/react"
import theme from "@/theme/themeConfig";
import '@/style/global.scss'
import {EditingStatusProvider, SelectedLocationProvider} from "@/utils/sharedStateProviders";

const isProd = process.env.NODE_ENV === 'production'

export default function App({ Component, pageProps }) {
  return (
    <ConfigProvider theme={theme}>
        <SessionProvider session={pageProps.session} basePath={isProd ? `/fortemap/api/auth` : `/api/auth`}>
            {
                Component.withoutLogin ? (
                    <Component {...pageProps} />
                ) : (
                <Auth>
                    <EditingStatusProvider>
                        <SelectedLocationProvider>
                            <Component {...pageProps} />
                        </SelectedLocationProvider>
                    </EditingStatusProvider>
                </Auth>
                )
            }
        </SessionProvider>
    </ConfigProvider>
  )
}

const Auth = ({children}) => {
    const {data, status} = useSession({
        required: true,
        onUnauthenticated() {
            signIn();
        },

    })

    if (status === "loading") {
        return <div>Loading...</div>
    }

    return children;
}