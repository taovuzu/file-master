import React from "react";
import { Layout, Row, Col } from "antd";

const ToolLayout = ({ children }) => {
  return (
    <Layout>
      <Row gutter={[24, 24]} justify="center">
        {React.Children.map(children, (child) =>
        <Col xs={24} sm={12} md={8} lg={6}>
            {child}
          </Col>
        )}
      </Row>
    </Layout>);

};

export default ToolLayout;