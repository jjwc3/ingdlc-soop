import { mount } from 'svelte'
import App from './App.svelte'

function mountApp() {
  const container = document.createElement('div')
  container.id = 'ingdlc-soop-vod'
  document.body.appendChild(container)
  mount(App, {
    target: container,
  })
}

mountApp()
