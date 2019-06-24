import React, { useState, useLayoutEffect } from 'react';
import { getPath, replacePathArrayBrackets, setPath } from './pathService';

const allEqual = arr =>
  arr.every(v => JSON.stringify(v) === JSON.stringify(arr[0]));

const flattenArrayToObj = arrayWithObjects => {
  const obj = {};

  arrayWithObjects.forEach(ObjectFromArray => {
    Object.keys(ObjectFromArray).forEach(key => {
      if (typeof ObjectFromArray[key] !== 'function') {
        obj[key] = ObjectFromArray[key];
      }
    });
  });

  return obj;
};

const absorbState = ({ stateOriginal, list, merge, context, type }) => {
  // rewrite return key with value when merge stategy
  const hasMergeStategy = merge !== undefined;

  const paths = list
    .map(item => {
      const pathResult = getPath(stateOriginal, replacePathArrayBrackets(item));

      if (hasMergeStategy) {
        return { [item]: pathResult };
      }
      return pathResult;
    })
    .filter(item => item !== undefined && item !== null);

  if (hasMergeStategy) {
    const mergeResult = merge({
      paths: flattenArrayToObj(paths),
      context,
      type,
    });
    if (mergeResult !== undefined && mergeResult !== null) {
      return mergeResult;
    }
    return null;
  }
  if (allEqual(paths)) {
    return paths[0];
  }
  return null;
};

const absorb = ({ stateOriginal, schema, context, type }) => {
  const temp = {};
  schema.forEach(entry => {
    const absorbStateResult = absorbState({
      stateOriginal,
      list: entry.references,
      merge: entry.merge,
      context,
      type,
    });
    if (absorbStateResult !== null) {
      setPath(temp, entry.key, absorbStateResult, false, false);
    }
  });
  return temp;
};

const reflect = ({ stateConverted, schema, stateOriginal }) => {
  const cloneStateOriginal = JSON.parse(JSON.stringify(stateOriginal));
  schema.forEach(entry => {
    entry.references.forEach(reference => {
      setPath(
        cloneStateOriginal,
        replacePathArrayBrackets(reference),
        stateConverted[entry.key],
        false,
        true,
      );
    });
  });
  return cloneStateOriginal;
};

const FinalFormConverterHook = ({
  stateOriginal,
  callback,
  schema,
  context,
  type,
}) => {
  const callbackHandler = stateConverted => {
    console.log('callbackHandler pressed', stateConverted);
    callback({
      formObject: reflect({
        stateConverted,
        schema,
        stateOriginal,
      }),
    });
  };

  const [convertedObject, setConvertedObject] = useState({});

  useLayoutEffect(() => {
    setConvertedObject(
      absorb({
        stateOriginal,
        schema,
        context,
        type,
      }),
    );
  }, [stateOriginal]);

  return [convertedObject, callbackHandler];
};

export default FinalFormConverterHook;

// const [converted, convertedCallback] = FinalFormConverterHook({ stateOriginal: {}, callback: () => {}, schema: {} });
