function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) => next => action => {
    if (typeof action === "function") {
      return action(dispatch, getState, extraArgument);
    }

    if ((action && action.$dispatch) || action.$async) {
      const { $dispatch, $async, before, after, success, error } = action;
      if ($dispatch) {
        (Array.isArray($dispatch) ? $dispatch : [$dispatch]).forEach(action => {
          dispatch(action);
        });
      }

      if ($async) {
        if (before) {
          dispatch(before);
        }
        const isMultipleResults = Array.isArray($async);
        const promises = (isMultipleResults ? $async : [$async]).map(a => {
          const { promise, ...action } =
            typeof a === "function" || typeof a.then === "function"
              ? { promise: a }
              : a;

          if (promise && typeof promise.then === "function") return promise;
          return new Promise((resolve, reject) => {
            const result = promise(
              {
                resolve,
                reject,
                getState,
                dispatch,
                extraArgument
              },
              action
            );

            if (result && typeof result.then === "function") {
              result.then(resolve, reject);
            }
          });
        });

        return Promise.all(promises)
          .then(
            payloads => {
              const successAction =
                success &&
                success(isMultipleResults ? payloads : payloads[0], {
                  getState,
                  dispatch,
                  extraArgument
                });
              successAction && dispatch(successAction);
            },
            e => {
              const errorAction =
                error && error(e, { getState, extraArgument, dispatch });
              errorAction && dispatch(errorAction);
            }
          )
          .finally(() => {
            const afterAction =
              after && after({ getState, dispatch, extraArgument });
            afterAction && dispatch(afterAction);
          });
      }
    }

    return next(action);
  };
}

const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;
