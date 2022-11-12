print('matlab works');

% plot x^2

x = 0:0.1:10;
f = x.^2;
ff = figure;

plot(x,y,'o',x,f,'-');
legend('data','x^2');
saveas(ff, 'figure.png');
