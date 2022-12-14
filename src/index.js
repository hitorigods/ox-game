import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props) {
	return (
		<button
			className={`square ${props.isHighlight ? 'is-highlight' : ''}`}
			onClick={props.onClick}
		>
			{props.value}
		</button>
	);
}

class Board extends React.Component {
	renderSquare(i, isHighlight = false) {
		return (
			<Square
				key={i}
				value={this.props.squares[i]}
				isHighlight={isHighlight}
				onClick={() => {
					this.props.onClick(i);
				}}
			/>
		);
	}

	render() {
		return (
			<div>
				{Array(3)
					.fill(null)
					.map((row, i) => {
						return (
							<div key={i} className="board-row">
								{Array(3)
									.fill(null)
									.map((col, j) => {
										return this.renderSquare(
											i * 3 + j,
											this.props.highlightLines.some(
												(line) => line === i * 3 + j
											)
										);
									})}
							</div>
						);
					})}
			</div>
		);
	}
}

class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			history: [
				{
					squares: Array(9).fill(null),
					col: 0,
					row: 0,
				},
			],
			stepNumber: 0,
			xIsNext: true,
			isSortAsc: true,
		};
	}

	handleClick(i) {
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		const current = history[history.length - 1];
		const squares = current.squares.slice();
		const calculate = calculateWinner(current.squares);
		if (calculate || squares[i]) {
			return;
		}
		squares[i] = this.state.xIsNext ? 'X' : 'O';
		this.setState({
			history: history.concat([
				{
					squares: squares,
					col: (i % 3) + 1,
					row: Math.floor(i / 3) + 1,
				},
			]),
			stepNumber: history.length,
			xIsNext: !this.state.xIsNext,
		});
	}

	jumpTo(step) {
		this.setState({
			stepNumber: step,
			xIsNext: step % 2 === 0,
		});
	}

	sortToggle() {
		this.setState({
			isSortAsc: !this.state.isSortAsc,
		});
	}

	render() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];
		const calculate = calculateWinner(current.squares);

		const moves = history.map((step, move) => {
			const desc = move
				? `Go to #${move}(${step.col},${step.row})`
				: 'game start';
			return (
				<li key={move}>
					<button onClick={() => this.jumpTo(move)}>
						{this.state.stepNumber === move ? <strong>{desc}</strong> : desc}
					</button>
				</li>
			);
		});

		let status = calculate
			? calculate.isDraw
				? 'Draw'
				: `Winner: ${calculate.winner}`
			: `Next player: ${this.state.xIsNext ? 'X' : 'O'}}`;

		return (
			<div className="game">
				<div className="game-board">
					<Board
						squares={current.squares}
						highlightLines={calculate ? calculate.lines : []}
						onClick={(i) => {
							this.handleClick(i);
						}}
					/>
				</div>
				<div className="game-info">
					<div>{status}</div>
					<ol>{this.state.isSortAsc ? moves : moves.reverse()}</ol>
					<button
						onClick={() => {
							this.sortToggle();
						}}
					>
						??????????????????
					</button>
				</div>
			</div>
		);
	}
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Game />);

function calculateWinner(squares) {
	const lines = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	];
	for (let i = 0; i < lines.length; i++) {
		const [a, b, c] = lines[i];
		if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
			return {
				winner: squares[a],
				lines: [a, b, c],
				isDraw: false,
			};
		}
	}

	if (squares.filter((e) => !e).length === 0) {
		return {
			winner: null,
			lines: [],
			isDraw: true,
		};
	}

	return null;
}
