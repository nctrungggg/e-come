import { ReactElement } from "react";
import Header from './header/Header'
import { Footer } from './footer/Footer'
import SideBar from "./sidebar/SideBar";
import AdminHeader from "./header/AdminHeader";
import { Layout } from "antd";

export const UserLayout = (Children: ReactElement) => {
    return (
        <div>
            <Header />
            {Children}
            <Footer />
        </div>

    )
}

export const AdminLayout = (Children: ReactElement) => {
    return (
        <Layout>
            <AdminHeader />
            <Layout>
                <SideBar />
                <Layout><div style={{ padding: '24px', maxHeight: 'calc(100vh - 80px)', minHeight: 'calc(100vh - 80px)', overflow: 'auto' }}>{Children}</div></Layout>

            </Layout>
        </Layout>
    )
}


