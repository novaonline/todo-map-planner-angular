import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { TodoContainerComponent } from './components/todo-container/todo-container.component';
import { MapPreviewComponent } from './components/map-preview/map-preview.component';
import { AgmCoreModule } from '@agm/core';
import { NavigationDirective } from './directives/navigation/navigation.directive';

@NgModule({
  declarations: [
    AppComponent,
    TodoContainerComponent,
    MapPreviewComponent,
    NavigationDirective,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyD_XFb9vJZZeeHL5gTrQybgEX1aglU69OY',
      libraries: ['places'],
    }),
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
