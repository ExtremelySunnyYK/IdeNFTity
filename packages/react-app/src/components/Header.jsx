import { PageHeader, Menu } from "antd";
import React from "react";
import { Link, Route, Switch, useLocation } from "react-router-dom";

// displays a page header

export default function Header({ link, title, subTitle }) {
  const location = useLocation();
  //position:"fixed",width:"100%" 
  return (  
    <Menu style={{}} selectedKeys={[location.pathname]} mode="horizontal">
        <Menu.Item key="/">
          <Link to="/">
            <PageHeader title={title} subTitle={subTitle} style={{ cursor: "pointer" }} />  
          </Link>
        </Menu.Item>
        <Menu.Item key="/debug">
          <Link to="/debug">Debug Contracts</Link>
        </Menu.Item>
    </Menu>
  );
}

Header.defaultProps = {
  link: "/",
  title: "👾 IdeNFTity",
  subTitle: "🖌	Paint you digital identity with us",
};
