import React, { Suspense, lazy } from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";

const Home = lazy(() => import(/* webpackChunkName:"home" */ "../container/Home"));
const Calculation = lazy(() => import(/* webpackChunkName:"calculation" */ "../container/Calculation"));

const Routes = () => (
  <BrowserRouter>
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Route path="/" component={Home} exact />
        <Route path="/calculation" component={Calculation} />
        <Redirect to="/" />
      </Switch>
    </Suspense>
  </BrowserRouter>
);

export default Routes;
