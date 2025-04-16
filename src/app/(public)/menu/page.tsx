import React, { Suspense } from 'react';
import ProductCatalogPage from './MenuComponent';

const page = () => {
    return (
        <div>
            <Suspense>
<ProductCatalogPage></ProductCatalogPage>
            </Suspense>
        </div>
    );
};

export default page;