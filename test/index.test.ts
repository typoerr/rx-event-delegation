import ava, { TestInterface } from 'ava'
import { delegate } from '../src/index'
import { firstValueFrom } from 'rxjs'
import { tap, map, take, toArray } from 'rxjs/operators'
import * as sinon from 'sinon'
import { JSDOM } from 'jsdom'

const test = ava as TestInterface<{ dom: JSDOM }>

test.before((t) => {
  const html = String.raw
  t.context.dom = new JSDOM(html`
    <div class="a">
      <div class="b">
        <div class="c">child a</div>
      </div>
    </div>
  `)
})

test.cb('delegate', (t) => {
  t.plan(3)

  const win = t.context.dom.window
  const doc = win.document

  const c = doc.querySelector('.c') as HTMLElement
  const select = delegate(doc.body)
  const mock = sinon.fake((ev: Event) => ev)

  const test$ = select('click', '.c').pipe(
    map(mock),
    tap((e) => t.is(e.target, c)),
    take(1),
    toArray(),
  )

  firstValueFrom(test$).then((arr) => {
    t.is(mock.callCount, 1)
    t.is(arr.length, 1)
    t.end()
  })

  c.dispatchEvent(new win.MouseEvent('click', { bubbles: true }))
  c.dispatchEvent(new win.MouseEvent('click', { bubbles: true }))
})
