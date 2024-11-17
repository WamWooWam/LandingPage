import { Component } from 'preact';

export default function CalculatorNavBar() {
    return (
        <div class="calc-navbar">
            <input
                name="calc-navbar"
                value="standard"
                type="radio"
                class="calc-navbar-item calc-navbar-standard"
                checked
            />
            <input
                name="calc-navbar"
                value="scientific"
                type="radio"
                class=" calc-navbar-item calc-navbar-scientific"
            />
            <input
                name="calc-navbar"
                value="converter"
                type="radio"
                class="calc-navbar-item calc-navbar-converter"
            />
        </div>
    );
}
