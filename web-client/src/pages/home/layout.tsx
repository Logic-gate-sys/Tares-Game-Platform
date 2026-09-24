import { NavigationBar } from "#components/home/navigationBar";
import { Outlet } from "react-router-dom";

export default function HomeLayout() {
    return (
        <>
          <NavigationBar/>
          <Outlet/>
        </>
    )
}