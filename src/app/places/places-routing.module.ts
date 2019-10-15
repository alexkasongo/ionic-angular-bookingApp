import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlacesPage } from './places.page';

const routes: Routes = [
    {
        path: 'tabs',
        component: PlacesPage,
        // make sure children names match the names we added on the ion-tab button "tab"
        children: [
            {
                path: 'discover',
                children: [
                    {
                        path: '',
                        loadChildren: './discover/discover.module#DiscoverPageModule'
                    },
                    {
                        path: ':placeId',
                        loadChildren: './discover/place-detail/place-detail.module#PlaceDetailPageModule'
                    }
                ]
            },
            {
                path: 'offers',
                children: [
                    {
                        path: '',
                        loadChildren: './offers/offers.module#OffersPageModule'
                    },
                    {
                        path: 'new',
                        loadChildren: './offers/new-offer/new-offer.module#NewOfferPageModule'
                    },
                    {
                        path: 'edit/:placeId',
                        loadChildren: './offers/edit-offer/edit-offer.module#EditOfferPageModule'
                    },
                    {
                        path: ':placeId',
                        loadChildren: './offers/offer-bookings/offer-bookings.module#OfferBookingsPageModule'
                    }
                ]
            },
            {
                path: '',
                redirectTo: './places/tabs/rediscover',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '',
        redirectTo: './places/tabs/discover',
        pathMatch: 'full'
    }
];

@NgModule({
    // child routes with forChild are basically merged with the global route definition once this module is lazy loaded.
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class PlacesRoutingModule {}
