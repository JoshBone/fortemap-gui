import {ConfigProvider} from "antd";
import theme from "@/theme/themeConfig";
import AppLayout from "@/components/Layout/AppLayout";
import '@/style/global.scss'

export default function App({ Component, pageProps }) {
  return (
    <ConfigProvider theme={theme}>
        <AppLayout>
            <Component {...pageProps} />
        </AppLayout>
    </ConfigProvider>
  )
}
