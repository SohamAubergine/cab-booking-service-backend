import { Container } from "@chakra-ui/react";
import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

const PageContainer = ({ children }: PageContainerProps) => {
  return (
    <Container maxW="container.xl" py={8}>
      {children}
    </Container>
  );
};

export default PageContainer;
