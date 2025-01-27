import React from "react"
import PropTypes from 'prop-types'

const Button = ({
    children,
    style = {},
    className = '',
    ...restProps
}) => {
    const styles = {
        padding: '10px 20px',
        margin: '0 10px',
        cursor: 'pointer',
        border: '1px solid #ccc',
        backgroundColor: '#f0f0f0',
        fontSize: '16px',
        ...style
      }

    return (
    <button
        className={`${className}`}
        style={styles}
        {...restProps}
        >
        {children}
    </button>
    )
}

Button.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
}

export {Button}