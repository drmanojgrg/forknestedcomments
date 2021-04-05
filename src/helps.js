import produce from 'immer';

function brign() {
  const path = 'foo.bar.zoo';
  const state = { foo: { bar: { zoo: 1 } } };

  const nextState = produce(state, (draft) => {
    const vector = path.split('.');
    console.log('vector', vector);

    const propName = vector.pop();

    if (propName) {
      draft = vector.reduce((it, prop) => it[prop], draft);
      draft[propName] += 1;
    }
  });

  expect(nextState.foo.bar.zoo).toEqual(state.foo.bar.zoo + 1);
}

brign();
