/**
 * This tranfsorm infers ES2015 class name from the
 * filename / directory name (if filename is index.js)
 * for React components.
 *
 * export default class extends React.Component {...}
 *
 * will become
 *
 * export default class FileName extends React.Component {...}
 */

import path from 'path';

module.exports = function(file, api) {
    const j = api.jscodeshift;
    const newClassId = path.basename(file.path, '.js');

    return j(file.source)
        .find(j.ClassExpression)
        .filter(path => {
            return (
                path.parent.value.type === 'ExportDefaultDeclaration'
                && path.value.superClass
                && path.value.superClass.object
                && path.value.superClass.property
                && (
                    path.value.superClass.object.name === 'React'
                    && path.value.superClass.property.name === 'Component'
                )
            )
        })
        .replaceWith(p => j.classDeclaration(j.identifier(newClassId), p.value.body, p.value.superClass))
        .toSource();
};
