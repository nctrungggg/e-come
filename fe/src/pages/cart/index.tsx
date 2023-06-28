import { Helmet } from "react-helmet";
import { CartContainer } from "../../containers/cart";

export const CartPage = () => {
  return (
    <div className="">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Cart</title>
      </Helmet>
      <div>
        <CartContainer />
      </div>
    </div>
  );
};
